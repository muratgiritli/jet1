import { runVetImport } from "../server/vet-import";

runVetImport((msg) => console.log(msg))
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
