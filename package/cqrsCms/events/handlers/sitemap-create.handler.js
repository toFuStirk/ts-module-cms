"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cqrs_1 = require("@nestjs/cqrs");
const sitemap_service_1 = require("../../../sitemap/sitemap.service");
const sitemap_create_event_1 = require("../impl/sitemap-create.event");
let SitemapCreateHandler = class SitemapCreateHandler {
    constructor(sitemapService) {
        this.sitemapService = sitemapService;
    }
    handle(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = "www.baidu.com";
            const arrayBaiduSiteMapOptions = {
                xmlFileName: event.createXml.xmlFileName,
                xmlSiteMap: event.createXml.xmlSiteMap,
                updateWhenPost: event.createXml.updateWhenPost,
                postLimit1000: event.createXml.postLimit1000,
                pageSelect: event.createXml.pageSelect,
                postSelect: event.createXml.postSelect,
            };
            this.sitemapService.commitXML(arrayBaiduSiteMapOptions, url);
        });
    }
};
SitemapCreateHandler = __decorate([
    cqrs_1.EventsHandler(sitemap_create_event_1.SitemapCreateEvent),
    __metadata("design:paramtypes", [sitemap_service_1.SitemapService])
], SitemapCreateHandler);
exports.SitemapCreateHandler = SitemapCreateHandler;

//# sourceMappingURL=sitemap-create.handler.js.map
