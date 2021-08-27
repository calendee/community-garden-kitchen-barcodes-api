import { z } from "zod";
import { json as IttyJson } from "itty-router-extras";
import { fetchJson } from "../utils";

function formatProductInfo(productInfo) {
	const regex = /(\d+\s?(oz|lbs?)|\d+\s?(ounces?|pounds?))/i;
	const { manufacturer, title, brand, mpn, weight } =
		productInfo?.products?.[0] ?? {};
	const derivedWeight = title?.match(regex)?.[0] ?? null;

	return {
		brand,
		manufacturer,
		mpn,
		title,
		weight: derivedWeight || weight,
	};
}

function validateBarcode(request) {
	const Code = z
		.string()
		.min(12, { message: "Please enter a 12 or 13 digit UPC code" })
		.max(13, { message: "Please enter a 12 or 13 digit UPC code" });

	const barcode = request.params.id;
	const validationResult = Code.safeParse(barcode);

	if (validationResult.success) {
		return { valid: true };
	}

	const errors = validationResult.error.issues.reduce((accumulator, issue) => {
		return { ...accumulator, barcode: issue.message };
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

async function fetchBarcodeData(barcode) {
	const { data, error } = await fetchJson(
		`${BARCODE_API_URL}?barcode=${barcode}&key=${BARCODE_API_KEY}`,
	);

	if (!data?.products[0]) {
		return { productInfo: null, error: "Failed to fetch product info." };
	}

	const productInfo = formatProductInfo(data);

	return { productInfo, error };
}

export async function getBarcodeById(request) {
	const barcode = request.params.id;
	const validation = validateBarcode(request);

	if (!validation.valid) {
		return validation.response;
	}

	const { productInfo, error } = await fetchBarcodeData(barcode);

	return IttyJson(
		{
			status: error ? "fail" : "success",
			barcode,
			info: productInfo || {
				title: "",
				brand: "",
				manufacturer: "",
				weight: "",
			},
			error,
		},
		{ headers: request.corsHeaders },
	);
}
