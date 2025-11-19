package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	MongoURI  string
	JWTSecret string
	JWTExpire int
	Port      string
	Env       string
}

var AppConfig *Config

func LoadConfig() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	jwtExpire, _ := strconv.Atoi(getEnv("JWT_EXPIRE", "168"))

	AppConfig = &Config{
		MongoURI:  getEnv("MONGODB_URI", ""),
		JWTSecret: getEnv("JWT_SECRET", ""),
		JWTExpire: jwtExpire,
		Port:      getEnv("PORT", "3000"),
		Env:       getEnv("ENV", "development"),
	}

	if AppConfig.MongoURI == "" {
		log.Fatal("MONGODB_URI is required")
	}

	if AppConfig.JWTSecret == "" {
		log.Fatal("JWT_SECRET is required")
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
