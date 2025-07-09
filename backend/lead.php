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
$name = $data['name'];
$phone = $data['phone'];
$email = $data['email'];
$price = (int)$data['price'];

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
                    "field_id" => 711283,
                    "values" => [
                        [
                            "value" => $phone
                        ]
                    ]
                ],
                [
                    "field_id" => 711285,
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
    curl_close($ch);

    $result = json_decode($response, true);
    $contactId = $result['_embedded']['contacts'][0]['id'];

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
                "field_id" => 715033,
                "values" => [
                    [
                        "value" => true
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
curl_close($ch);

