package handle

import "github.com/gin-gonic/gin"

func InitRouter() *gin.Engine {
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()
	apiGroup := r.Group("/api")
	{
		dishGroup := apiGroup.Group("/dish")
		{
			dishGroup.GET("/list", ListDish)
		}
	}
	return r
}
