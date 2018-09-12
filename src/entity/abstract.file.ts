import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export class AbstractFile {
    /*分类Id*/
    @PrimaryGeneratedColumn()
    id: number;

    /*分类名称*/
    @Column({
        nullable: false,
        length: 120,
    })
    title: string;

    /*分类别名*/
    @Column({
        nullable: false,
        length: 120,
    })
    classifyAlias: string;

    /*内链*/
    @Column({
        nullable: true,
        length: 200,
    })
    chainUrl: string;

    /*描述*/
    @Column({
        nullable: true,
        length: 200,
    })
    describe: string;

    /*颜色*/
    @Column({
        nullable: true,
        length: 40,
    })
    color: string;

    /*父节点*/
    @Column({
        name: "parentId",
        nullable: true
    })
    parentId: number;

    /*层级*/
    @Column({
        name: "level",
        nullable: true,
    })
    level: number;

    /*创建时间*/
    @CreateDateColumn()
    createAt: Date;

    /*修改时间*/
    @UpdateDateColumn()
    updateAt: Date;
}