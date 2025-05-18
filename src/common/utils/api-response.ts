export class ApiResponse<T> {
  constructor(
    public message: string,
    public data: T,
    public meta?: { page: number; limit: number; total: number }, // Optional meta for pagination
  ) {}
}
