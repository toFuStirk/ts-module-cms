import {
    Entity,
    ManyToOne,
    Tree,
    TreeChildren,
    TreeParent
} from "typeorm";
import { PageEntity } from "./page.entity";
import { AbstractFile } from "./abstract.file";

@Entity("page_classify_table")
@Tree("nested-set")
export class PageClassifyEntity extends AbstractFile {
    @TreeChildren()
    children: Array<PageClassifyEntity>;

    @TreeParent()
    parent: PageClassifyEntity;

    @ManyToOne(
        type => PageEntity,
        pageEntity => pageEntity.classify,
    )
    pages: PageEntity;
}
