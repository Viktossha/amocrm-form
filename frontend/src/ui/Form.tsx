import {Button, FormControl, FormGroup, Grid, TextField} from "@mui/material";
import {type SubmitHandler, useForm} from "react-hook-form";
import styles from './Form.module.css'

type Inputs = {
    name: string;
    email: string;
    phone: string;
    price: number;
};
export const Form = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<Inputs>({
        defaultValues: {name: "", email: ""},
    });
    const onSubmit: SubmitHandler<Inputs> = (data) => {
        //тут будем диспатчить санку?
        console.log(data);
        reset()
    };

    return (
        <Grid container justifyContent={"center"}>
            <Grid justifyContent={"center"}>
                <FormControl>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FormGroup>
                            <TextField
                                label="Имя"
                                margin="normal"
                                {...register("name", {
                                    required: "Обязательное поле",
                                    pattern: {
                                        value: /^[a-zA-Zа-яА-ЯёЁ\s-]+$/,
                                        message: "Некорректное имя",
                                    },
                                })}
                            />
                            {errors.name && <span className={styles.errorMessage}>{errors.name.message}</span>}
                            <TextField
                                label="Email"
                                margin="normal"
                                {...register("email", {
                                    required: "Обязательное поле",
                                    pattern: {
                                        value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                                        message: "Некорректный email",
                                    },
                                })}
                            />
                            {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
                            <TextField
                                label="Телефон"
                                margin="normal"
                                {...register("phone", {
                                    required: "Обязательное поле",

                                })}/>
                            {errors.phone && <span className={styles.errorMessage}>{errors.phone.message}</span>}
                            <TextField
                                type="number"
                                label="Цена"
                                margin="normal"
                                {...register("price", {
                                    required: "Обязательное поле",
                                })}/>
                            {errors.price && <span className={styles.errorMessage}>{errors.price.message}</span>}
                            <Button type={"submit"} variant={"contained"} color={"primary"}>
                                Отправить
                            </Button>
                        </FormGroup>
                    </form>
                </FormControl>
            </Grid>
        </Grid>
    );
};