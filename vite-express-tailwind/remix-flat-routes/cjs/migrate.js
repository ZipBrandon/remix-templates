"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToRoute = exports.flatFolders = exports.flatFiles = exports.migrate = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const index_1 = require("./index");
function migrate(sourceDir, targetDir, options = { convention: 'flat-files' }) {
    // var visitor = options.convention === 'flat-files' ? flatFiles : flatFolders
    // visitFiles(sourceDir, visitor(sourceDir, targetDir))
    // const routes = createRoutesFromFolders(defineRoutes, {
    //   appDirectory: './app',
    //   routesDirectory: sourceDir,
    // })
    console.log('Removed createRoutesFromFolders for Remix 2.0.0');
    const routes = {};
    // Object.entries(routes).forEach(([_key, route]) => {
    //   let file = route.file
    //   let flat = file
    //     .replace(/[\/]/g, '.')
    //     .replace(/\._([^_.])/g, '.[_]$1')
    //     .replace(/\.__/g, '._')
    //     .replace(/\.index.tsx$/, '._index.tsx')
    //     .replace(/^routes\./, 'routes/')
    //   console.log(flat)
    // })
}
exports.migrate = migrate;
function flatFiles(sourceDir, targetDir) {
    return (file) => {
        console.log(file);
        let extension = path.extname(file);
        let name = file.substring(0, file.length - extension.length);
        const route = convertToRoute(name);
        const targetFile = path.join(targetDir, `${route}${extension}`);
        fs.cpSync(path.join(sourceDir, file), targetFile, { force: true });
    };
}
exports.flatFiles = flatFiles;
const routeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.md', '.mdx'];
function flatFolders(sourceDir, targetDir) {
    return (file) => {
        console.log(file);
        const extension = path.extname(file);
        const name = file.substring(0, file.length - extension.length);
        const route = convertToRoute(name);
        const targetFolder = path.join(targetDir, route);
        if (!routeExtensions.includes(extension)) {
            return;
        }
        fs.mkdirSync(targetFolder, { recursive: true });
        fs.cpSync(path.join(sourceDir, file), path.join(targetFolder, `/_index${extension}`), {
            force: true,
        });
    };
}
exports.flatFolders = flatFolders;
function convertToRoute(name) {
    const pathSegments = name.split(path.sep);
    return pathSegments
        .map(pathSegment => {
        const index = /(^|[.])index$/.test(pathSegment);
        const routeSegments = (0, index_1.getRouteSegments)(pathSegment, index);
        return getFlatRoute(routeSegments);
    })
        .join('.');
}
exports.convertToRoute = convertToRoute;
function getFlatRoute(segments) {
    return segments
        .map(segment => segment.startsWith('__')
        ? segment.substring(1)
        : segment === 'index'
            ? '_index'
            : segment)
        .join('.');
}
