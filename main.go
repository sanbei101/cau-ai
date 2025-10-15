package main

import (
	"github.com/sanbei101/cau-ai-backend/handle"
)

func main() {
	// handle.InitDish()
	router := handle.InitRouter()
	router.Run(":8000")
}
