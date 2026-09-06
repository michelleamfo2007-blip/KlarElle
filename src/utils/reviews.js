export async function attachReviewStats(supabase, products = []) {
  if (!products.length) return products;

  const { data } = await supabase
    .from('product_reviews')
    .select('product_id, rating, status')
    .in('product_id', products.map((product) => product.id));

  const approved = (data || []).filter((review) => (review.status || 'Approved') === 'Approved');
  const byProduct = {};

  approved.forEach((review) => {
    if (!byProduct[review.product_id]) {
      byProduct[review.product_id] = { sum: 0, count: 0 };
    }
    byProduct[review.product_id].sum += Number(review.rating) || 0;
    byProduct[review.product_id].count += 1;
  });

  return products.map((product) => {
    const stats = byProduct[product.id];
    return {
      ...product,
      reviewCount: stats?.count || 0,
      reviewAvg: stats?.count ? (stats.sum / stats.count).toFixed(1) : null
    };
  });
}
