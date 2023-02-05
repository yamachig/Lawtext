#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { CdkStack } from "../lib/_cdk-stack";
import { parse } from "dotenv";
import * as fs from "fs";
import * as path from "path";

const dotenv_path = path.join(__dirname, "../.env");
const dotenv_variables = fs.existsSync(dotenv_path) ? parse(fs.readFileSync(dotenv_path)) : {};

const stackName = dotenv_variables.NAME_PREFIX ? `${dotenv_variables.NAME_PREFIX}_stack`.split("_").join("-") : dotenv_variables.STACK_NAME;

const app = new cdk.App();
new CdkStack(app, stackName, {});
