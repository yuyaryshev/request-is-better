module.exports = async () => {
  return {
	"rootDir": "src",
	"testRegex": "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|jsx|js|cjs|mjs)$",
	"preset": "ts-jest",
	"resolver": "jest-ts-webcompat-resolver"
  };
};