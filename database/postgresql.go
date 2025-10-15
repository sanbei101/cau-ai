package database

import (
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var PG *gorm.DB

func init() {
	dsn := "host=101.201.49.155 user=postgres password=secretpassword dbname=mydatabase port=5432 sslmode=disable TimeZone=Asia/Shanghai"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	PG = db
}
