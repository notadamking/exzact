export type ActionType<
  InputType extends z.ZodTypeAny,
  ResponseType extends any
> = (input: z.infer<InputType>) => Promise<ResponseType>;
