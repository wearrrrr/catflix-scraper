type turbovidResponse = {
    type: "juice_key" | "the_juice";
    success: boolean,
    msg: string,
    juice: string,
    juice_post: string
    data: string;
};

type JuiceData = {
    juice_key: string,
    the_juice: string,
}