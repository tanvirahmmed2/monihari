import { ConnectDB } from "@/lib/mongoose";
import Product from "@/models/product";
import { NextResponse } from "next/server";

// GET /api/products/[slug]
export async function GET(request, context) {
  try {
    await ConnectDB();

    const slugParam = context?.params?.slug;
    const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Slug is required",
        },
        { status: 400 }
      );
    }

    const product = await Product.findOne({ slug });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Successfully fetched product data",
        payload: product,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/products/[slug]] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch data",
        error: error?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
