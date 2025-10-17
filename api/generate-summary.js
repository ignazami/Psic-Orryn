export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { userQuery, systemPrompt } = request.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('API key is not configured on the server.');
    }

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    const apiResponse = await fetch(`https://generativelen/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error('API Error:', errorData);
      throw new Error(`API Error: ${apiResponse.statusText}`);
    }

    const result = await apiResponse.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    response.status(200).json({ summary: text || "No se pudo generar el resumen." });

  } catch (error) {
    console.error('Error in serverless function:', error);
    response.status(500).json({ message: 'Error al conectar con el servicio de IA.', error: error.message });
  }
}