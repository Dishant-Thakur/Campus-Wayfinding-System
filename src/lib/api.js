export const handle = (fn) => async (req, ctx) => {
  try {
    return await fn(req, ctx);
  } catch (e) {
    const status =
      e.name === "ValidationError" || e.name === "CastError" ? 400 : e.code === 11000 ? 409 : 500;
    return Response.json({ error: e.message }, { status });
  }
};

export const unauthorized = () => Response.json({ error: "Unauthorized" }, { status: 401 });
export const notFound = (m = "Not found") => Response.json({ error: m }, { status: 404 });