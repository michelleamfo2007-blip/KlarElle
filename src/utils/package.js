export const PACKAGE_LENGTH_CM = 45;
export const PACKAGE_WIDTH_CM = 35;
export const PACKAGE_HEIGHT_CM = 5;

export function productNeedsPackageSync(product) {
  return Number(product?.length) !== PACKAGE_LENGTH_CM
    || Number(product?.width) !== PACKAGE_WIDTH_CM
    || Number(product?.height) !== PACKAGE_HEIGHT_CM;
}

export async function syncAllProductPackageDimensions(client) {
  return client
    .from('products')
    .update({
      length: PACKAGE_LENGTH_CM,
      width: PACKAGE_WIDTH_CM,
      height: PACKAGE_HEIGHT_CM
    })
    .neq('id', '00000000-0000-0000-0000-000000000000');
}
