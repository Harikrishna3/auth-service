package routes

import (
	"auth-service-go/controllers"
	"auth-service-go/middleware"

	"github.com/gofiber/fiber/v2"
)

func SetupAuthRoutes(app *fiber.App) {
	api := app.Group("/api/auth")

	api.Post("/signup", middleware.ValidateSignup, controllers.Signup)
	api.Post("/signin", middleware.ValidateSignin, controllers.Signin)
	api.Get("/profile", middleware.Protect, controllers.GetProfile)
}
