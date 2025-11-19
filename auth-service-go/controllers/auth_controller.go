package controllers

import (
	"auth-service-go/config"
	"auth-service-go/models"
	"auth-service-go/utils"
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func Signup(c *fiber.Ctx) error {
	req := c.Locals("signupData").(models.SignupRequest)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := config.DB.Collection("users")

	var existingUser models.User
	err := collection.FindOne(ctx, bson.M{"email": req.Email}).Decode(&existingUser)
	if err == nil {
		return utils.ErrorResponse(c, 400, "User already exists with this email", nil)
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return utils.ErrorResponse(c, 500, "Error hashing password", nil)
	}

	user := models.User{
		ID:        primitive.NewObjectID(),
		Email:     req.Email,
		Password:  hashedPassword,
		Name:      req.Name,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err = collection.InsertOne(ctx, user)
	if err != nil {
		return utils.ErrorResponse(c, 500, "Error creating user", nil)
	}

	token, err := utils.GenerateToken(user.ID.Hex())
	if err != nil {
		return utils.ErrorResponse(c, 500, "Error generating token", nil)
	}

	return utils.SuccessResponse(c, 201, "User registered successfully", models.AuthResponse{
		User:  &user,
		Token: token,
	})
}

func Signin(c *fiber.Ctx) error {
	req := c.Locals("signinData").(models.SigninRequest)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := config.DB.Collection("users")

	var user models.User
	err := collection.FindOne(ctx, bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		return utils.ErrorResponse(c, 401, "Invalid credentials", nil)
	}

	if !utils.ComparePassword(user.Password, req.Password) {
		return utils.ErrorResponse(c, 401, "Invalid credentials", nil)
	}

	token, err := utils.GenerateToken(user.ID.Hex())
	if err != nil {
		return utils.ErrorResponse(c, 500, "Error generating token", nil)
	}

	return utils.SuccessResponse(c, 200, "Login successful", models.AuthResponse{
		User:  &user,
		Token: token,
	})
}

func GetProfile(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)

	return utils.SuccessResponse(c, 200, "Profile retrieved successfully", fiber.Map{
		"user": user,
	})
}
