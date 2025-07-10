<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$domain = $_ENV['AMOCRM_DOMAIN'];
$accessToken = $_ENV['AMOCRM_TOKEN'];
$headers = [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $accessToken,
];

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['name'], $data['phone'], $data['email'], $data['price'])) {
    http_response_code(400);
    echo json_encode(["message" => "Некорректные данные"]);
    exit();
}

$name = $data['name'];
$phone = $data['phone'];
$email = $data['email'];
$price = (int)$data['price'];
$timeOnSiteOver30 = $data['timeOnSiteOver30'];

function getContactsByQuery($query, $domain, $headers)
{
    $ch = curl_init("https://$domain/api/v4/contacts?query=$query");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

$contactsByPhone = getContactsByQuery($phone, $domain, $headers);
$contactsByEmail = getContactsByQuery($email, $domain, $headers);

$contactId = null;

if (!empty($contactsByPhone['_embedded']["contacts"])) {
    $contactId = $contactsByPhone['_embedded']['contacts'][0]['id'];
} elseif (!empty($contactsByEmail['_embedded']["contacts"])) {
    $contactId = $contactsByEmail['_embedded']['contacts'][0]['id'];
}

if (is_null($contactId)) {
    $contactData = [
        [
            "name" => $name,
            "custom_fields_values" => [
                [
                    "field_id" => (int)$_ENV['PHONE_FIELD_ID'],
                    "values" => [
                        [
                            "value" => $phone
                        ]
                    ]
                ],
                [
                    "field_id" => (int)$_ENV['EMAIL_FIELD_ID'],
                    "values" => [
                        [
                            "value" => $email
                        ]
                    ]
                ]
            ]
        ],
    ];

    $ch = curl_init("https://$domain/api/v4/contacts");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($contactData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $response = curl_exec($ch);
    if (!$response) {
        http_response_code(500);
        echo json_encode(["message" => "Ошибка при создании контакта"]);
        exit();
    }
    curl_close($ch);

    $result = json_decode($response, true);
    $contactId = $result['_embedded']['contacts'][0]['id'];

    if (empty($contactId)) {
        http_response_code(500);
        echo json_encode(["message" => "ID контакта не получен"]);
        exit();
    }

}


$leadData = [
    [
        "name" => 'Заявка с формы',
        "price" => $price,
        "_embedded" => [
            "contacts" => [
                ["id" => $contactId]
            ]
        ],
        "custom_fields_values" => [
            [
                "field_id" => (int)$_ENV['TIME_ON_SITE_FIELD_ID'],
                "values" => [
                    [
                        "value" => $timeOnSiteOver30
                    ]
                ]
            ],
        ]
    ],
];

$ch = curl_init("https://$domain/api/v4/leads");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($leadData));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$response = curl_exec($ch);
if (!$response) {
    http_response_code(500);
    echo json_encode(["message" => "Ошибка при создании лида"]);
    exit();
}
curl_close($ch);

http_response_code(200);
echo json_encode(["message" => "Лид успешно создан"]);
exit();
