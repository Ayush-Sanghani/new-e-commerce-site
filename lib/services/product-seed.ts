import { prisma } from "@/lib/db";

const PHARMA_PRODUCTS = [
  {
    title: "Ankle Binder",
    description: "Tynor D-01 Ankle Binder is an effective device to support, compress and partially immobilize the ankle following injury or sprain to control pain, oedema or inflammation. Composed of two components...",
    category: "Orthopedic Supports",
    price: 190,
    brand: "Tynor",
    sku: "VF-ANKL-001",
    keyFeatures: ["Provides support, compression and immobilization", "Controls pain, oedema or inflammation"],
    keyBenefits: ["Sprains and strains of the ankle, muscle, tendon and ligament injuries", "Effective as a prophylaxis for sports person."],
    directionsForUse: "Use as per requirement or as directed by the physician.",
    safetyInformation: "Read the label carefully before use. Keep out of the reach of children. Store in a cool and dry place. It is recommended to close hook loop fasteners before washing. Hand wash with mild detegent and water below 30°C. Don't dry clean, bleach and iron.",
    usesIndications: "Ankle Support",
    packSize: "1 Count",
    isSterile: false,
    isSingleUse: false,
    images: ["/Utils/Ankle Binder 1.jpg", "/Utils/Ankle Binder 2.jpg", "/Utils/Ankle Binder 3.jpg"],
  },
  {
    title: "Arm Cast Cover – Universal",
    description: "Tynor Arm Cast Cover provides superior protection for arm casts, shielding them from moisture and contaminants to ensure hygiene and longevity. Constructed from high-quality, medical-grade materials...",
    category: "Orthopedic Supports",
    price: 267,
    brand: "Tynor",
    sku: "VF-ARMC-001",
    keyFeatures: ["Expandable Rubber Diaphragm", "Rigid Ring", "Transparent Flexible Body", "Anatomic Shape"],
    keyBenefits: ["Complete Moisture Protection", "User-Friendly Design", "Comfort and Durability", "Enhanced Aesthetics and Functionality", "Patient Safety"],
    directionsForUse: null,
    safetyInformation: null,
    usesIndications: null,
    packSize: "1 Count",
    isSterile: false,
    isSingleUse: false,
    images: ["/Utils/Arm Cast Cover – Universal    1.jpg", "/Utils/Arm Cast Cover – Universal  2.jpg", "/Utils/Arm Cast Cover – Universal 3.jpg"],
  },
  {
    title: "Lace Pull LS Belt Medium",
    description: "Tynor Lacepull LS Belt is a state-of-the-art brace designed to provide exceptional lumbosacral comfort using most-suited fabric & unmatched technology. Its ergonomic design provides effective support, relieving lower back pain and correcting posture. Equipped with a lace-pull mechanism for controlled compression, it supports lumbar decompression while maintaining comfort. Flexible semi-rigid splints contour the back, ensuring excellent immobilization.",
    category: "Orthopedic Supports",
    price: 1077,
    brand: "Tynor",
    sku: "VF-LSBLT-001",
    keyFeatures: ["High-quality cotton yarn: breathable, hypoallergenic.", "Lace-pull mechanism: allows customizable compression.", "Flexible semi-rigid splints: contoured back for immobilization.", "Durable, lightweight, and designed for everyday wear.", "Most-recommended brand by orthopedics & therapists."],
    keyBenefits: ["Provides relief from lower back pain and posture correction.", "Adjustable compression adapts to user needs for optimal comfort.", "Ventilated fabric ensures long-term wearability and skin health.", "Enhances post-operative recovery with superior stabilization.", "Long-lasting durability for extended use."],
    directionsForUse: null,
    safetyInformation: null,
    usesIndications: "Lower back pain, posture correction, post-operative stabilization",
    packSize: "1 Count",
    isSterile: false,
    isSingleUse: false,
    images: ["/Utils/Lace Pull LS Belt Medium 1.jpg", "/Utils/Lace Pull LS Belt Medium 2.jpg", "/Utils/Lace Pull LS Belt Medium 3.jpg"],
  },
  {
    title: "Gauze Swab 4's Sterile Type-17 - 5cm x 5cm x 12 ply Pack of 25",
    description: "Introducing the 4Utouch Gauze Swab in Sterile Type-17, an essential component of sterile wound care protocols. These swabs are meticulously crafted from 100% cotton gauze fabric, renowned for its exceptional absorbency and softness. Bleached using a blend of hydrogen peroxide and demineralized water...",
    category: "Wound Care & Dressings",
    price: 165,
    brand: "4Utouch",
    sku: "VF-GSWB-001",
    keyFeatures: ["100% Cotton Gauze Fabric", "Hydrogen Peroxide Bleaching"],
    keyBenefits: ["Exceptional Absorbency", "Soft and Gentle", "Sterile Packaging"],
    directionsForUse: null,
    safetyInformation: null,
    usesIndications: "Wound management",
    packSize: "Pack of 25",
    isSterile: true,
    isSingleUse: true,
    images: ["/Utils/Gauze Swab 4's Sterile 1.jpg", "/Utils/Gauze Swab 4's Sterile 2.jpg"],
  },
  {
    title: "Hysteroscopy Diagnostic Sheath - 4mm",
    description: "The Uromed Hysteroscopy Diagnostic Sheath – 4mm is designed to facilitate a clear and stable visual examination of the uterine cavity during minimally invasive hysteroscopic procedures. This diagnostic sheath allows for accurate visualization of conditions such as polyps, fibroids, adhesions, and other abnormalities.",
    category: "Surgical Instruments",
    price: 10240,
    brand: "Uromed",
    sku: "VF-HYS-001",
    keyFeatures: ["Accurate Uterine Examination", "Durable Medical-Grade Materials", "Slim, Ergonomic Design", "Enhanced Diagnostic Capabilities", "Minimally Invasive"],
    keyBenefits: ["Accurate visualization of conditions such as polyps, fibroids, adhesions"],
    directionsForUse: null,
    safetyInformation: null,
    usesIndications: "Hysteroscopy procedures",
    packSize: "1 Count",
    isSterile: true,
    isSingleUse: false,
    images: ["/Utils/Hysteroscopy Diagnostic Sheath 1.jpg", "/Utils/Hysteroscopy Diagnostic Sheath 2.jpg", "/Utils/Hysteroscopy Diagnostic Sheath 3.jpg"],
  },
  {
    title: "Veress Needle 120mm Pack of 20",
    description: "mb+ Veress Needle - 120mm Pack of 20 (VN120):For the establishment of pneumoperitoneum in laparoscopic surgery.",
    category: "Surgical Instruments",
    price: 14974,
    brand: "mb+",
    sku: "VF-VN-001",
    keyFeatures: ["The puncture needle is made of 304 stainless steel with excellent performance", "The puncture needle has good puncture performance and is easy for doctors to operate.", "The head of the inner core is designed with rounded corners to avoid tissue damage.", "Single use to avoid cross infection"],
    keyBenefits: ["Establishment of pneumoperitoneum in laparoscopic surgery"],
    directionsForUse: null,
    safetyInformation: null,
    usesIndications: "Laparoscopic surgery",
    packSize: "Pack of 20",
    isSterile: true,
    isSingleUse: true,
    images: ["/Utils/Veress Needle 1.jpg", "/Utils/Veress Needle 2.jpg", "/Utils/Veress Needle 3.jpg"],
  },
  {
    title: "Polymed Micro Polysyte Trio Clear Connector with - 15cm Small Bore Extension Tubing Pack of 75",
    description: "Introducing the Polymed Micro Polysyte Clear Connector, an innovative solution for intravenous (IV) therapy designed to optimize patient safety and clinical efficiency.",
    category: "IV Therapy & Accessories",
    price: 13064,
    brand: "Polymed",
    sku: "VF-POLY-001",
    keyFeatures: ["Neutral Displacement Connector", "Split-Septum Technology", "Minimal Dead Space", "Swabable Surface", "Saline Flush Option", "Compatibility and Safety", "Needle-Free Technology"],
    keyBenefits: ["Enhanced Patient Safety", "Improved Clinical Efficiency", "Infection Control"],
    directionsForUse: null,
    safetyInformation: null,
    usesIndications: "Intravenous (IV) therapy",
    packSize: "Pack of 75",
    isSterile: true,
    isSingleUse: true,
    images: ["/Utils/Polymed Micro Polysyte 1.jpg", "/Utils/Polymed Micro Polysyte 2.jpg"],
  },
  {
    title: "CoaguChek XS System Box of 1",
    description: "The Roche CoaguChek XS System is a compact and reliable point-of-care coagulation analyzer designed for the quantitative measurement of Prothrombin Time (PT) and International Normalized Ratio (INR) in capillary or venous whole blood. This portable system provides fast and accurate results within minutes.",
    category: "Diagnostic Devices",
    price: 27500,
    brand: "Roche",
    sku: "VF-COAG-001",
    keyFeatures: ["Compact and reliable point-of-care coagulation analyzer", "Provides fast and accurate results within minutes"],
    keyBenefits: ["Quantitative measurement of Prothrombin Time (PT) and International Normalized Ratio (INR)"],
    directionsForUse: null,
    safetyInformation: null,
    usesIndications: "Measurement of Prothrombin Time (PT) and International Normalized Ratio (INR)",
    packSize: "Box of 1",
    isSterile: false,
    isSingleUse: false,
    images: ["/Utils/CoaguChek 1.jpg", "/Utils/CoaguChek 2.jpg", "/Utils/CoaguChek 3.jpg"],
  }
];

function categoryToSlug(category: string): string {
  return category.toLowerCase().trim().replace(/\s+/g, "-");
}

export async function seedProductsFromDummyJson(): Promise<{
  success: boolean;
  message: string;
  created: number;
  updated: number;
  errors?: string[];
}> {
  const errors: string[] = [];
  let created = 0;
  let updated = 0;

  for (const p of PHARMA_PRODUCTS) {
    try {
      const result = await upsertOneProduct(p);
      if (result === "created") created++;
      else updated++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`SKU ${p.sku}: ${msg}`);
    }
  }

  return {
    success: errors.length === 0,
    message:
      errors.length === 0
        ? `Seeded ${created + updated} products (${created} created, ${updated} updated).`
        : `Seeded with ${errors.length} error(s).`,
    created,
    updated,
    errors: errors.length > 0 ? errors : undefined,
  };
}

async function upsertOneProduct(p: any): Promise<"created" | "updated"> {
  const slug = categoryToSlug(p.category);

  const category = await prisma.category.upsert({
    where: { slug },
    create: { name: p.category, slug },
    update: { name: p.category },
  });

  let brandId: string | null = null;
  if (p.brand && p.brand.trim()) {
    let brand = await prisma.brand.findFirst({
      where: { name: p.brand.trim() },
    });
    if (!brand) {
      brand = await prisma.brand.create({ data: { name: p.brand.trim() } });
    }
    brandId = brand.id;
  }

  const existing = await prisma.product.findUnique({ where: { sku: p.sku } });

  const productData = {
    title: p.title,
    description: p.description,
    categoryId: category.id,
    brandId,
    price: p.price,
    sku: p.sku,
    stock: 100, // default stock 100
    keyFeatures: p.keyFeatures,
    keyBenefits: p.keyBenefits,
    directionsForUse: p.directionsForUse,
    safetyInformation: p.safetyInformation,
    usesIndications: p.usesIndications,
    packSize: p.packSize,
    isSterile: p.isSterile,
    isSingleUse: p.isSingleUse,
    availabilityStatus: "In Stock",
    thumbnail: p.images[0], // using first image as thumbnail
  };

  let productId: string;

  if (existing) {
    await prisma.product.update({
      where: { id: existing.id },
      data: productData,
    });
    productId = existing.id;

    await prisma.productImage.deleteMany({ where: { productId } });
  } else {
    const product = await prisma.product.create({
      data: productData,
    });
    productId = product.id;
  }

  if (p.images && p.images.length > 0) {
    await prisma.productImage.createMany({
      data: p.images.map((url: string, i: number) => ({
        productId,
        url,
        sortOrder: i,
      })),
    });
  }

  return existing ? "updated" : "created";
}
