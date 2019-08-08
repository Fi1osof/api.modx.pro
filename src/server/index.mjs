
import startServer from "@prisma-cms/server";

import Module from "../";

import URI from "urijs";

const module = new Module({
});

const resolvers = module.getResolvers();


const modx_pro_request = async function (url, args) {

  const uri = new URI(url);

  args && uri.query(args);

  return await fetch(uri.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(r => r.json());

}


startServer({
  typeDefs: 'src/schema/generated/api.graphql',
  resolvers,
  contextOptions: {
    resolvers,
    modx_pro_request,
  },
});
