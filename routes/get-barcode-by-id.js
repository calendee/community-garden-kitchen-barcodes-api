import { z } from "zod";
import { json as IttyJson } from "itty-router-extras";
import { fetchJson } from "../utils";

function validateBarCode(request) {
	const Code = z
		.string()
		.min(12, { message: "Please enter a 12 or 13 digit UPC code" })
		.max(13, { message: "Please enter a 12 or 13 digit UPC code" });

	const barCode = request.params.id;
	const validationResult = Code.safeParse(barCode);

	if (validationResult.success) {
		return { valid: true };
	}

	const errors = validationResult.error.issues.reduce((accumulator, issue) => {
		return { ...accumulator, [issue.path[0]]: issue.message };
	}, {});

	const response = new Response(
		JSON.stringify({
			status: "failed",
			errors: errors,
		}),
		{
			headers: {
				...request.corsHeaders,
				["content-type"]: "application/json; charset=utf-8",
			},
			status: 400,
		},
	);

	return { valid: false, response };
}

async function fetchBarCodeData(barCode) {
	const { data, error } = await fetchJson(
		`${BARCODE_API_URL}?barcode=${barCode}&key=${BARCODE_API_KEY}`,
	);

	return { barCodeInfo: data, error };
}

export async function getBarcodeById(request) {
	const barCode = request.params.id;
	const validation = validateBarCode(request);

	if (!validation.valid) {
		return validation.response;
	}

	const { barCodeInfo, error } = await fetchBarCodeData(barCode);

	return IttyJson(
		{
			status: error ? "fail" : "success",
			data: { barCode, info: barCodeInfo, error },
		},
		{ headers: request.corsHeaders },
	);
}
