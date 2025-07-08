import axios from "axios"

export const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        Authorization: `Bearer ${import.meta.env.VITE_AMOCRM_TOKEN}`
    },
})

export type leadArgs = {
    price: number
    _embedded: {
        contacts: { id: number }[]
    }
    custom_fields_values?: Array<{
        "field_id": number,
        "values": { value: string | number | boolean }[]
    }>
}

export type contactArgs = {
    first_name: string
    custom_fields_values?: Array<{
        field_id: number,
        values: { value: string | number | boolean }[]
    }>
}

type Response<K extends string> = {
    _links: {
        self: {
            href: string
        }
    }
    _embedded: {
        [key in K]: Array<{
            id: number
            request_id: string,
            _links: {
                self: {
                    href: string
                }
            }
        }>
    }
};

export const leadApi = {
    leadsAdd(args: leadArgs) {
        return instance.post<Response<"leads">>("/leads", args)
    },
    contactsAdd(args: contactArgs[]) {
        return instance.post<Response<"contacts">>('/contacts', args)
    }
}