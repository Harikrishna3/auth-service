package middleware

import (
	"auth-service-go/models"
	"auth-service-go/utils"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func ValidateSignup(c *fiber.Ctx) error {
	var req models.SignupRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, 400, "Invalid request body", nil)
	}

	errors := make(map[string]string)

	if req.Email == "" || !isValidEmail(req.Email) {
		errors["email"] = "Please provide a valid email"
	}

	if len(req.Password) < 6 {
		errors["password"] = "Password must be at least 6 characters long"
	}

	if req.Name == "" {
		errors["name"] = "Name is required"
	}

	if len(errors) > 0 {
		return utils.ErrorResponse(c, 400, "Validation failed", errors)
	}

	c.Locals("signupData", req)
	return c.Next()
}

func ValidateSignin(c *fiber.Ctx) error {
	var req models.SigninRequest
	if err := c.BodyParser(&req); err != nil {
		return utils.ErrorResponse(c, 400, "Invalid request body", nil)
	}

	errors := make(map[string]string)

	if req.Email == "" || !isValidEmail(req.Email) {
		errors["email"] = "Please provide a valid email"
	}

	if req.Password == "" {
		errors["password"] = "Password is required"
	}

	if len(errors) > 0 {
		return utils.ErrorResponse(c, 400, "Validation failed", errors)
	}

	c.Locals("signinData", req)
	return c.Next()
}

func isValidEmail(email string) bool {
	return strings.Contains(email, "@") && strings.Contains(email, ".")
}
