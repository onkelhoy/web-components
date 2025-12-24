import { getDependencyOrder } from "@papit/util-cli";

export default async function (info, args) {
  const data = await getDependencyOrder(batch => {
    console.log('batch', batch)
  }, { info, args });

  console.log(JSON.stringify(data, null, 2))
}