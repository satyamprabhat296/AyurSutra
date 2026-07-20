// export const successResponse = (res, data, message = "Success", status = 200) => {
//   return res.status(status).json({
//     success: true,
//     message,
//     data,
//   });
// };

// export const errorResponse = (res, message = "Something went wrong", status = 500) => {
//   return res.status(status).json({
//     success: false,
//     message,
//   });
// };
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

export default ApiResponse;