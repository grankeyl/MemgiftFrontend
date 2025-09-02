const NftSlice = () => ({
  getAll(nfts: object) {
    const nftsArray = Object.values(nfts || {});
    return nftsArray.sort((a, b) => b.nftPrice - a.nftPrice);
  },
});

export default NftSlice;