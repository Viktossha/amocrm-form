import {Button, CircularProgress, FormControl, FormGroup, Grid, TextField} from "@mui/material";
import {type SubmitHandler, useForm} from "react-hook-form";
import styles from './Form.module.css'
import {useEffect, useState} from "react";
import {selectIsLoading, sendLead} from "../model/leadSlice.ts";
import {useDispatch, useSelector} from "react-redux";
import type {AppDispatch} from "../store.ts";

export type Inputs = {
    name: string;
    email: string;
    phone: string;
    price: string;
    timeOnSiteOver30: boolean
};
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()

export const Form = () => {
    const isLoading = useSelector(selectIsLoading)
    const dispatch = useAppDispatch()

    const [timeOver, setTimeOver] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<Inputs>({
        defaultValues: {name: "", email: "", timeOnSiteOver30: false},
    });

    useEffect(() => {
        const timeoutID = setTimeout(() => {
            setTimeOver(true)
        }, 30001)

        return () => clearTimeout(timeoutID)
    }, []);

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        dispatch(sendLead(data))
        reset({
            name: '',
            email: '',
            phone: '',
            price: '',
            timeOnSiteOver30: timeOver,
        })
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
                                label="Цена"
                                margin="normal"
                                {...register("price", {
                                    required: "Обязательное поле",
                                })}/>
                            {errors.price && <span className={styles.errorMessage}>{errors.price.message}</span>}
                            <TextField type='hidden' {...register('timeOnSiteOver30')}/>
                            <Button type={"submit"} variant={"contained"} color={"primary"}>
                                Отправить
                            </Button>
                        </FormGroup>
                    </form>
                    {isLoading && (
                        <div className={styles.circularProgressContainer}>
                            <CircularProgress size={50} thickness={3} />
                        </div>
                    )}
                </FormControl>
            </Grid>
        </Grid>
    );
};