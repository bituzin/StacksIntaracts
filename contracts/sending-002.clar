(define-constant ERR_INVALID_AMOUNT u100)
(define-constant ERR_TRANSFER_FAILED u101)
(define-constant ERR_TRANSFER_NOT_FOUND u102)

(define-map transfer-log uint {
  sender: principal,
  recipient: principal,
  amount: uint,
  timestamp: uint
})

(define-map sender-last-transfer principal uint)

(define-data-var next-transfer-id uint u0)

(define-public (send-stx (recipient principal) (amount uint))
  (begin
    (asserts! (> amount u0) (err ERR_INVALID_AMOUNT))
    (unwrap! (stx-transfer? amount tx-sender recipient) (err ERR_TRANSFER_FAILED))
    (let
      (
        (transfer-id (var-get next-transfer-id))
        (timestamp stacks-block-time)
      )
      (map-set transfer-log transfer-id {
        sender: tx-sender,
        recipient: recipient,
        amount: amount,
        timestamp: timestamp
      })
      (map-set sender-last-transfer tx-sender timestamp)
      (var-set next-transfer-id (+ transfer-id u1))
      (ok transfer-id)
    )
  )
)

(define-read-only (get-transfer (transfer-id uint))
  (match (map-get? transfer-log transfer-id)
    transfer (ok transfer)
    (err ERR_TRANSFER_NOT_FOUND))
)

(define-read-only (get-transfer-timestamp (transfer-id uint))
  (match (map-get? transfer-log transfer-id)
    transfer (ok (get timestamp transfer))
    (err ERR_TRANSFER_NOT_FOUND))
)

(define-read-only (get-last-transfer-timestamp (sender principal))
  (ok (default-to u0 (map-get? sender-last-transfer sender)))
)

(define-read-only (get-next-transfer-id)
  (ok (var-get next-transfer-id))
)
