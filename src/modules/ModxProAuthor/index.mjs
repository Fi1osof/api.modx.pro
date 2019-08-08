
import PrismaModule from "@prisma-cms/prisma-module";
import PrismaProcessor from "@prisma-cms/prisma-processor";

export class ModxProAuthorProcessor extends PrismaProcessor {

  constructor(props) {

    super(props);

    this.objectType = "ModxProAuthor";
  }


  async modx_pro_authors_connection(source, args, info) {

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
    } = where || {};

    let result = await modx_pro_request("https://modstore.pro/assets/components/extras/action.php", {
      action: "authors/getlist",
      work: work === true ? true : undefined,
      rating: rating === true ? true : undefined,
      ...where,
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


export default class ModxProAuthorModule extends PrismaModule {

  constructor(props = {}) {

    super(props);

    this.mergeModules([
    ]);

  }


  getProcessor(ctx) {
    return new (this.getProcessorClass())(ctx);
  }


  getProcessorClass() {
    return ModxProAuthorProcessor;
  }


  getResolvers() {


    return {
      Query: {
        modx_pro_authors_connection: (source, args, ctx, info) => {
          return this.getProcessor(ctx).modx_pro_authors_connection(source, args, info);
        },
      },
      ModxProAuthorsConnection: {
        results: async (source, args, ctx, info) => {

          let {
            results,
          } = source || {};


          if (info) {

            /**
             * Если был запрошен пользователь с самого modx.pro,
             * запрашиваем список всех пользователей с него
             */
            if (info.fieldNodes.find(n => {
              // console.log("n.selectionSet.selections", n.selectionSet.selections.find(i => i.name.value === "User"));
              return n.selectionSet.selections.find(i => i.name.value === "User") ? true : false;
            })) {


              const {
                resolvers: {
                  Query: {
                    modx_pro_users_connection,
                  },
                },
              } = ctx;

              /**
               * Получаем список всех пользователей с modx.pro
               */
              const users = await modx_pro_users_connection(null, {
                limit: 0,
              }, ctx)
                .then(({ results }) => results);

              /**
               * Ищем пользователя и присваиваем текущему объекту автора
               */
              results.map(n => {

                const {
                  id,
                  fullname,
                } = n;

                const User = users.find(i => i.username === id || i.username === fullname);

                // if(!User) {
                //   console.error("User not found", n);
                // }

                n.User = User;

              });

            }

          }


          return results;
        }
      },
    }

  }

}