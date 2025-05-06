class ApiResponse<T> {
    error : boolean;
    message?: string;
    data: T;

    constructor(error: boolean, data: T, message?: string) {
        this.error = error,
        this.data = data;
        this.message = message || 'Request successful';
    }

    // Static method for success responses
    static success<T>(data: T, message?: string): ApiResponse<T> {
        return new ApiResponse<T>(false, data, message);
    }

    static failure<T>(data: T, message?: string): ApiResponse<T> {
        return new ApiResponse<T>(true, data, message);
    }
}  