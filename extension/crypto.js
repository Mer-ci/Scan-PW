var rsa = new RSAKey();

var e = "3"; // Public exponent 65537 plus secure
var lengthRSA = 1024;
var gen = true;

function genrsa() {
  console.log("genRsA");
  if (gen) {
    rsa.generate(lengthRSA,e);
    window.localStorage.setItem("pubKey",rsa.n.toString(16));
    gen =false;
  }
  return rsa;
}
function do_encrypt(text, Nrsa) {
  if (Nrsa) {
    var tryEncrypt = new RSAKey();
    tryEncrypt.setPublic(Nrsa.n, Nrsa.e);
    return tryEncrypt.encrypt(text);
  }else {
    return "error";
  }
}
function do_decrypt(text, Nrsa) {
  if (Nrsa) {
    var tryDecrypt = new RSAKey();
    tryDecrypt.setPrivateEx(Nrsa.n, e, Nrsa.d, Nrsa.p, Nrsa.q, Nrsa.dmp1, Nrsa.dmq1, Nrsa.coeff);
    return tryDecrypt.decrypt(text);
  }else{
    return "error";
  }
}
function getPubliKey() {
  return window.localStorage.getItem("pubKey");
}