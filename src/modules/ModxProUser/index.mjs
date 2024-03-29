
import PrismaModule from "@prisma-cms/prisma-module";
import PrismaProcessor from "@prisma-cms/prisma-processor";

export class ModxProUserProcessor extends PrismaProcessor {

  constructor(props) {

    super(props);

    this.objectType = "ModxProUser";
  }


  async modx_pro_users_connection(source, args, info) {

    const {
      ctx: {
        modx_pro_request,
      },
    } = this;

    const {
      where,
      orderBy,
      ...otherArgs
    } = args;


    const {
      work_only: work,
      positive_rating_only: rating,
      ...otherWhere
    } = where || {}

    let result = await modx_pro_request("https://modx.pro/assets/components/modxpro/action.php", {
      action: "user/getlist",
      work: work === true ? true : undefined,
      rating: rating === true ? true : undefined,
      ...otherWhere,
      ...orderBy,
      ...otherArgs,
    });


    // console.log("result", JSON.stringify(result, true, 2));

    let {
      success,
      message,
      data,

      limit = 0,
      start,
      total = 0,
      pages = [],
      results = [],
    } = result;

    return {
      success,
      message,
      data,

      limit,
      start,
      total,
      pages,
      results: results.map(n => {

        let {
          work,
        } = n;

        return {
          ...n,
          work: work === "1" ? true : false,
        }
      }),
    };
  }

}


export default class ModxProUserModule extends PrismaModule {

  constructor(props = {}) {

    super(props);

    this.mergeModules([
    ]);

  }


  getProcessor(ctx) {
    return new (this.getProcessorClass())(ctx);
  }


  getProcessorClass() {
    return ModxProUserProcessor;
  }


  getResolvers() {


    return {
      Query: {
        modx_pro_users_connection: (source, args, ctx, info) => {
          return this.getProcessor(ctx).modx_pro_users_connection(source, args, info);
        },
      },
      // Mutation: {
      // },
      // Subscription: {
      // },
      // ModxProUserResponse: {
      //   data: (source, args, ctx, info) => {

      //     const {
      //       id,
      //     } = source.data || {};

      //     return id ? ctx.db.query.modxProUser({
      //       where: {
      //         id,
      //       },
      //     }, info) : null;
      //   },
      // },
    }

  }

}