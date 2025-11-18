class ApiError extends Error{
    constructor(
        statusCode,
        message="Something went Wrong",
        errors=[],
        stacks=""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.sucess = false
        this.errors = errors

        if(stacks){
            this.stacks = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}