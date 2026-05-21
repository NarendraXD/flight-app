-- seat lock RPC: prevents double-booking race conditions
create or replace function reserve_seat(
  p_seat_id uuid,
  p_user_id uuid,
  p_flight_id uuid,
  p_total_price numeric,
  p_pnr_code text
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_booking_id uuid;
begin
  -- lock the seat row to prevent concurrent reservations
  perform id from seats
  where id = p_seat_id and is_available = true
  for update;

  if not found then
    raise exception 'Seat is no longer available';
  end if;

  -- mark seat as taken
  update seats set is_available = false where id = p_seat_id;

  -- create the booking
  insert into bookings (user_id, flight_id, seat_id, total_price, pnr_code)
  values (p_user_id, p_flight_id, p_total_price, p_pnr_code)
  returning id into v_booking_id;

  return v_booking_id;
end;
$$;

-- cancellation trigger: block cancellations within 2 hours of departure
create or replace function check_cancellation_window()
returns trigger
language plpgsql
as $$
declare
  v_departs_at timestamptz;
begin
  if NEW.status = 'cancelled' and OLD.status != 'cancelled' then
    select departs_at into v_departs_at
    from flights where id = OLD.flight_id;

    if v_departs_at - now() < interval '2 hours' then
      raise exception 'Cannot cancel within 2 hours of departure';
    end if;
  end if;
  return NEW;
end;
$$;

create trigger enforce_cancellation_window
before update on bookings
for each row execute function check_cancellation_window();