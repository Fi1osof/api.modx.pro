
import fs from "fs";

import chalk from "chalk";

import PrismaModule from "@prisma-cms/prisma-module";

import MergeSchema from 'merge-graphql-schemas';

import path from 'path';

const moduleURL = new URL(import.meta.url);

const __dirname = path.dirname(moduleURL.pathname);

const { createWriteStream, unlinkSync } = fs;

const { fileLoader, mergeTypes } = MergeSchema



class Module extends PrismaModule {


  constructor(props = {}) {

    super(props);

    Object.assign(this, {
    });

    this.foo_json = this.foo_json.bind(this);

  }


  getSchema(types = []) {


    let schema = fileLoader(__dirname + '/schema/database/', {
      recursive: true,
    });


    if (schema) {
      types = types.concat(schema);
    }


    let typesArray = super.getSchema(types);

    return typesArray;

  }


  getApiSchema(types = []) {


    let baseSchema = [];

    let schemaFile = __dirname + "/../schema/generated/prisma.graphql";

    if (fs.existsSync(schemaFile)) {
      baseSchema = fs.readFileSync(schemaFile, "utf-8");
    }

    let apiSchema = super.getApiSchema(types.concat(baseSchema), []);

    let schema = fileLoader(__dirname + '/schema/api/', {
      recursive: true,
    });

    apiSchema = mergeTypes([apiSchema.concat(schema)], { all: true });


    return apiSchema;

  }


  getResolvers() {

    const {
      Subscription,
      ...resolvers
    } = super.getResolvers();


    Object.assign(resolvers.Query, {
      foo_string: this.foo_string,
      foo_number: this.foo_number,
      foo_json: this.foo_json,
    });

    Object.assign(resolvers.Mutation, {
      calc_sum: this.calc_sum,
    });

    // Object.assign(resolvers.Subscription, this.Subscription);


    Object.assign(resolvers, {
    });

    return resolvers;
  }


  foo_string(source, args, ctx, info) {

    return "Some string";

  }


  foo_number(source, args, ctx, info) {

    return (Math.random() * 1000).toFixed();
  }


  foo_json(source, args, ctx, info) {

    const date = new Date();

    return {
      date: {
        date,
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDay(),
      },
      foo_number: this.foo_number(),
    }
  }


  calc_sum(source, args, ctx, info) {

    const {
      vars,
    } = args;

    if (vars.length < 2) {
      throw new Error("Необходимо минимум два числа");
    }

    return vars.reduce((a, b) => a + b);
  }

}


export default Module;