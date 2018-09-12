import { ClassifyEntity } from "../../entity/classify.entity";
import { PageClassifyEntity } from "../../entity/pageClassify.entity";

export interface ClassifyInterface {
    // 分类id
    id: number;
    // 分类名称
    title: string;
    // 分类别名
    classifyAlias: string;
    // 内链
    chainUrl: string;
    // 描述
    describe: string;
    // 颜色
    color: string;
    // 父节点
    parentId: number;
    // 是否显示当前分类文章
    isCurrentType: boolean;
    // 是否显示子级分类文章
    isChildType: boolean;
    // 是否显示全局置顶文章
    isAllTop: boolean;
    // 是否显示上级置顶文章
    isPreTop: boolean;
    // 父级
    parent: ClassifyEntity | PageClassifyEntity;
}

