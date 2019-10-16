import { encryptAndSign, keyToBuffer, verifySignature } from "./crypto"

describe('encryptAndSign', () => {
  it('should add a signature to a message', () => {
    const key = keyToBuffer('deadbeef')
    const signatureKey = keyToBuffer('c0ffee')
    const signed = encryptAndSign('foo', key, signatureKey)
    
    console.log(signed)
    
    expect(verifySignature(signed, signatureKey)).toBeTruthy()
  })
})