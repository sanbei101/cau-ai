package handle

import "github.com/gin-gonic/gin"

func InitRouter() *gin.Engine {
	r := gin.Default()
	gin.SetMode(gin.ReleaseMode)
	apiGroup := r.Group("/api")
	{
		dishGroup := apiGroup.Group("/dish")
		{
			dishGroup.GET("/list", ListDish)
		}
	}
	return r
}
