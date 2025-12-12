import cloudinary from "@/lib/cloudinary";
import { ConnectDB } from "@/lib/mongoose";
import { isAdmin } from "@/middleware/isAdmin";
import Product from "@/models/product";
import { NextResponse } from "next/server";
import slugify from "slugify";

export async function POST(req) {
  try {
    await ConnectDB();
    const auth = await isAdmin()
    if (!auth.success) {
      return NextResponse.json({
        success: false,
        message: 'Only admin can access'
      }, { status: 400 })

    }

    const formData = await req.formData();

    const title = formData.get("title");
    const unit = formData.get("unit");
    const category = formData.get("category");
    const description = formData.get("description");
    const price = formData.get("price");
    const wholeSalePrice = formData.get("wholeSalePrice");
    const discount = formData.get("discount");
    const quantity = formData.get("quantity");
    const imageFile = formData.get("image");

    if (!title || !category || !description || !price || !wholeSalePrice || !quantity || !unit) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill all required fields",
        },
        { status: 400 }
      );
    }

    const slug = slugify(title.trim(), { lower: true });

    const existProduct = await Product.findOne({ slug });

    if (existProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Product already exists",
        },
        { status: 400 }
      );
    }

    if (!imageFile) {
      return NextResponse.json(
        {
          success: false,
          message: "Please upload an image",
        },
        { status: 400 }
      );
    }

    const newPrice = price - discount




    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

    const cloudImage = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "monihari" },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
      stream.end(imageBuffer);
    });


    const newProduct = new Product({
      title,
      category,
      description,
      price: newPrice,
      oldPrice: price,
      wholeSalePrice,
      discount,
      quantity,
      slug,
      unit,
      image: cloudImage.secure_url,
      imageId: cloudImage.public_id,
    });

    await newProduct.save();

    return NextResponse.json(
      {
        success: true,
        message: "Product added successfully",
        payload: newProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add product",
        error: error.message,
      },
      { status: 500 }
    );
  }
}


export async function GET() {
  try {
    await ConnectDB()
    const products = await Product.find().sort({ addedAt: -1 })

    if (!products || products === null) {
      return NextResponse.json({
        success: false,
        message: "No product data available"
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "successfully fetched product data",
      payload: products
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch data'
    }, { status: 500 })
  }

}


export async function DELETE(req) {
  try {
    await ConnectDB()

    const { id } = await req.json()
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Product id didnot recieved'
      }, { status: 400 })
    }
    const product = await Product.findById(id)
    if (!product || product === null) {
      return NextResponse.json({
        success: false,
        message: 'Product not found'
      }, { status: 400 })
    }

    await cloudinary.uploader.destroy(product.imageId)

    await Product.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: "successfully removed product"
    }, { status: 200 })


  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    }, { status: 500 })
  }

}


export async function PATCH(req) {
  try {
    await ConnectDB();

    const { _id, title, category, description, quantity, unit, discount, oldPrice } = await req.json()
    if (!title || !category || !description || !oldPrice || !quantity || !unit) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill all required fields",
        },
        { status: 400 }
      );
    }

    const slug = slugify(title.trim(), { lower: true });

    const product = await Product.findById(_id)

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 400 }
      );
    }
    const newPrice = oldPrice - discount

    product.title = title
    product.category = category
    product.description = description
    product.slug = slug
    product.discount = discount
    product.oldPrice = price
    product.price = newPrice
    product.quantity = quantity
    product.unit = unit


    await product.save()


    return NextResponse.json(
      {
        success: true,
        message: "Product added successfully",
        payload: product,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add product",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
