/**
 * 分页返回的模板
 */
export class ResultListPage<T> {
    // 状态码
    code: number;
    // 提示
    msg: string;
    /**
     * 返回的数据 T
     */
    data: T;
    /**
     * 返回有分页页码
     */
    pageNum: number;
    /**
     * 返回有分页每页条数
     */
    pageSize: number;
    /**
     * 返回有分页总页数
     */
    totalCount: number;
    /**
     * 返回有分页总条数
     */
    totalPage: number;

    constructor(code: number, msg: string, data: T, pageNum: number, pageSize: number, totalCount: number, totalPage: number) {
        this.code = code;
        this.msg = msg;
        this.data = data;
        this.pageNum = pageNum;
        this.pageSize = pageSize;
        this.totalCount = totalCount;
        this.totalPage = totalPage;
    }
}
