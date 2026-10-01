import { listVoices } from "../server/tts.js";
export default async function handler(_req, res) {
  try { res.status(200).json(await listVoices()); }
  catch (err) { res.status(err.status || 500).json({ error: err.message }); }
}
