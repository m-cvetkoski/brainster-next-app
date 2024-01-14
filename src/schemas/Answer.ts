import {z} from "zod";

const Answer = z.object({
    answer: z.string()
})

export default Answer;