export function notFound(res, message) {
  return res.status(404).json({ error: 'NOT_FOUND', message });
}

export function badRequest(res, message) {
  return res.status(400).json({ error: 'BAD_REQUEST', message });
}
