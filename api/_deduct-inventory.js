import { applyOrderDeduction } from '../src/utils/stock.js';

export async function deductInventoryForItems(supabase, items = []) {
  const linesByProduct = new Map();

  for (const item of items) {
    const productId = item.product_id || item.id;
    const quantity = parseInt(item.quantity, 10) || 0;
    if (!productId || quantity < 1) continue;
    const list = linesByProduct.get(productId) || [];
    list.push({
      quantity,
      size: item.size || item.selectedSize || null,
      color: item.color || item.selectedColor || null,
      source: item.fulfilledFrom || item.fulfilled_from || null
    });
    linesByProduct.set(productId, list);
  }

  for (const [productId, lines] of linesByProduct.entries()) {
    const { data: product, error } = await supabase
      .from('products')
      .select('id, stock, stock_international, variant_images, availability_mode, tags')
      .eq('id', productId)
      .single();

    if (error || !product) {
      console.error('Inventory deduct skipped, product missing:', productId, error?.message);
      continue;
    }

    let next = product;
    for (const line of lines) {
      next = applyOrderDeduction(next, line).product;
    }

    const { error: updateError } = await supabase
      .from('products')
      .update({
        stock: next.stock,
        stock_international: next.stock_international,
        variant_images: next.variant_images
      })
      .eq('id', productId);

    if (updateError) {
      console.error('Inventory deduct failed for', productId, updateError.message);
    }
  }
}
