package middleware

import (
	"auth-service-go/config"
	"auth-service-go/models"
	"auth-service-go/utils"
	"context"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func Protect(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")

	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		return utils.ErrorResponse(c, 401, "Not authorized to access this route", nil)
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")

	claims, err := utils.VerifyToken(token)
	if err != nil {
		return utils.ErrorResponse(c, 401, "Invalid or expired token", nil)
	}

	userID, err := primitive.ObjectIDFromHex(claims.UserID)
	if err != nil {
		return utils.ErrorResponse(c, 401, "Invalid user ID", nil)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var user models.User
	collection := config.DB.Collection("users")
	err = collection.FindOne(ctx, bson.M{"_id": userID}).Decode(&user)

	if err != nil {
		return utils.ErrorResponse(c, 404, "User not found", nil)
	}

	c.Locals("user", &user)
	return c.Next()
}
