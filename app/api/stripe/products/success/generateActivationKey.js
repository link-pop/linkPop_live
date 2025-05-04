// ! qookeys specific: Add activation keys to each item
// test generated ActivationKey
export function generateActivationKey() {
  const segments = 5;
  const charsPerSegment = 5;
  const chars = "BCDFGHJKMNPQRSTVWXYZ23456789"; // Excluded similar looking characters

  let key = [];
  for (let i = 0; i < segments; i++) {
    let segment = "";
    for (let j = 0; j < charsPerSegment; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    key.push(segment);
  }

  return key.join("-");
}
