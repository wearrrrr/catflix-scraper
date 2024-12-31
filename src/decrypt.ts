function hexToBinary(data: string) {
    let str = "";
    for (let i = 0; i < data.length; i += 2) {
      str += String.fromCharCode(parseInt(data.substr(i, 2), 16));
    }
    return str;
  }
function xorDecrypt(data: string, key: string) {
    let str = "";
    for (let i = 0; i < data.length; i++) {
      str += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return str;
}
function decryptHexWithKey(data: string, key: string) {
    const h2b = hexToBinary(data);
    return xorDecrypt(h2b, key);
}

export { decryptHexWithKey };