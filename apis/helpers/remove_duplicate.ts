export function processErrorMessages(error: any): any {
  let message: any

  if (error.message) {
    return error.messages
  }

  if (error?.messages?.errors) {
    // Utilise un Set pour éliminer les doublons
    const uniqueErrors = Array.from(
      new Set(error.messages.errors.map((err: any) => JSON.stringify(err)))
    ).map((err: any) => JSON.parse(err))

    message = uniqueErrors
  } else {
    message = error?.message
  }

  return message
}
